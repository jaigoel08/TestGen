import { simpleGit, SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const git: SimpleGit = simpleGit();

export async function cloneRepository(repoUrl: string): Promise<{ repoPath: string; cleanup: () => Promise<void> }> {
  const repoId = uuidv4();
  const repoPath = path.join(process.cwd(), 'tmp', 'repos', repoId);
  
  await fs.mkdir(repoPath, { recursive: true });
  console.log(`[GitHub] Cloning ${repoUrl} into ${repoPath}...`);
  
  await git.clone(repoUrl, repoPath);
  
  const cleanup = async () => {
    try {
      await fs.rm(repoPath, { recursive: true, force: true });
      console.log(`[GitHub] Cleaned up ${repoPath}`);
    } catch (err) {
      console.error(`[GitHub] Failed to cleanup ${repoPath}:`, err);
    }
  };
  
  return { repoPath, cleanup };
}

export async function getSourceFiles(repoPath: string, extensions: string[] = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.go']): Promise<{ path: string; content: string }[]> {
  const files: { path: string; content: string }[] = [];
  
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next' || entry.name === 'dist') continue;
        await walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          const content = await fs.readFile(fullPath, 'utf-8');
          files.push({ 
            path: path.relative(repoPath, fullPath), 
            content 
          });
        }
      }
    }
  }
  
  await walk(repoPath);
  return files;
}
