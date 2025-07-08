#!/usr/bin/env node
/**
 * Script para preparação do deploy para produção Oracle
 * Este script automatiza a limpeza de arquivos desnecessários antes do deploy
 * 
 * Uso: node prepare-deploy.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando preparação para deploy em produção Oracle...');

// Cria pasta de deploy se não existir
const DEPLOY_DIR = path.join(__dirname, 'deploy-oracle');
if (!fs.existsSync(DEPLOY_DIR)) {
  fs.mkdirSync(DEPLOY_DIR, { recursive: true });
  console.log(`✅ Pasta de deploy criada: ${DEPLOY_DIR}`);
}

// Função para ler lista de arquivos a remover
function getFilesToRemove() {
  try {
    const filePath = path.join(__dirname, 'ARQUIVOS-PARA-REMOVER.txt');
    const content = fs.readFileSync(filePath, 'utf8');
    return content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.trim());
  } catch (error) {
    console.error('❌ Erro ao ler arquivo ARQUIVOS-PARA-REMOVER.txt:', error.message);
    return [];
  }
}

// Função para copiar arquivos essenciais
function copyEssentialFiles() {
  const essentialFiles = [
    'index.html',
    'login.html',
    'help.html',
    'favicon.svg',
    'users.json',
    'package.json',
    'package-lock.json',
    'proxy-server.js',
    '.env.production.example'
  ];

  const essentialDirs = {
    'css': ['styles.css', 'login.css'],
    'js': [
      'production-config.js',
      'auth.js',
      'login.js',
      'app.js',
      'cache-manager.js',
      'dashboard-manager.js',
      'export-manager.js',
      'firmware-manager.js',
      'performance-manager.js',
      'reset-system.js'
    ]
  };

  // Copiar arquivos principais
  essentialFiles.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const targetPath = path.join(DEPLOY_DIR, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copiado: ${file}`);
    } else {
      console.warn(`⚠️ Arquivo não encontrado: ${file}`);
    }
  });

  // Copiar diretórios específicos
  Object.entries(essentialDirs).forEach(([dir, files]) => {
    const targetDir = path.join(DEPLOY_DIR, dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    files.forEach(file => {
      const sourcePath = path.join(__dirname, dir, file);
      const targetPath = path.join(DEPLOY_DIR, dir, file);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Copiado: ${dir}/${file}`);
      } else {
        console.warn(`⚠️ Arquivo não encontrado: ${dir}/${file}`);
      }
    });
  });

  // Criar arquivo .env a partir do exemplo
  const envExamplePath = path.join(__dirname, '.env.production.example');
  const envTargetPath = path.join(DEPLOY_DIR, '.env');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envTargetPath);
    console.log('✅ Criado arquivo .env para produção');
  } else {
    console.warn('⚠️ Arquivo .env.production.example não encontrado');
  }

  // Adicionar README para produção
  const readmePath = path.join(__dirname, 'README-PRODUCAO.md');
  const readmeTargetPath = path.join(DEPLOY_DIR, 'README.md');
  
  if (fs.existsSync(readmePath)) {
    fs.copyFileSync(readmePath, readmeTargetPath);
    console.log('✅ Copiado README para produção');
  }
}

// Função principal
function main() {
  console.log('🧹 Iniciando preparação dos arquivos para produção...');
  
  // Listar arquivos a serem removidos
  const filesToRemove = getFilesToRemove();
  console.log(`📋 ${filesToRemove.length} arquivos/diretórios serão excluídos da versão de produção`);

  // Copiar apenas os arquivos essenciais
  copyEssentialFiles();

  // Criar arquivo de verificação
  const deployCheckPath = path.join(DEPLOY_DIR, 'deploy-info.json');
  fs.writeFileSync(deployCheckPath, JSON.stringify({
    deployDate: new Date().toISOString(),
    version: '2.0.0',
    environment: 'production-oracle',
    preparedBy: 'prepare-deploy.js'
  }, null, 2));

  console.log('\n🎉 Preparação para deploy concluída!');
  console.log(`📁 Versão de produção disponível em: ${DEPLOY_DIR}`);
  console.log('⚠️ LEMBRETE: Ajuste o arquivo .env com suas credenciais antes do deploy.\n');
  console.log('🚀 Para instalar dependências e iniciar, execute:');
  console.log('   cd deploy-oracle');
  console.log('   npm install --production');
  console.log('   npm start\n');
}

// Executar
main();
