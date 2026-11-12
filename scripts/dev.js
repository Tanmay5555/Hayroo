import { spawn } from 'child_process';

console.log('🚀 Starting Hayroo Frontend (Vite) and Backend (Express)...');
console.log('👉 Frontend will be available at: http://localhost:5173');
console.log('👉 Backend will be available at:  http://localhost:5000\n');

const backend = spawn('npm run dev --prefix backend', {
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn('npm run dev --prefix frontend', {
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  if (backend && backend.pid) {
    try {
      process.kill(backend.pid);
    } catch {}
  }
  if (frontend && frontend.pid) {
    try {
      process.kill(frontend.pid);
    } catch {}
  }
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
