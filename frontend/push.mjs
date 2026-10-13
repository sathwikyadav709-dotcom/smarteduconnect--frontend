import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
  console.log('=== Pushing SmartEduConnect Frontend to GitHub ===\n');

  const repoUrl = 'https://github.com/sathwikyadav709-dotcom/smarteduconnect--frontend.git';
  let token = process.argv[2] || process.env.GITHUB_TOKEN;

  if (!token) {
    token = await askQuestion('Enter GitHub Personal Access Token (PAT): ');
    token = token ? token.trim() : null;
  }

  if (!token) {
    console.error('Error: Token is required.');
    process.exit(1);
  }

  rl.close();

  console.log(`Pushing 'main' to ${repoUrl}...`);
  try {
    await git.push({
      fs,
      http,
      dir: '.',
      remote: 'origin',
      ref: 'main',
      force: true,
      onAuth: () => ({
        username: token,
        password: token
      })
    });
    console.log('\n Successfully pushed frontend to GitHub!');
    console.log(`Repository: https://github.com/sathwikyadav709-dotcom/smarteduconnect--frontend`);
  } catch (err) {
    console.error('\nPush failed:', err.message);
    if (err.data) console.error('Details:', err.data);
    process.exit(1);
  }
}

main();
