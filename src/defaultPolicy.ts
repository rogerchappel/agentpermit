import type { Policy } from './types.js';

export const defaultPolicy: Policy = {
  version: 1,
  name: 'agentpermit-default',
  defaultEffect: 'warn',
  rules: [
    {
      id: 'allow-read-fixtures',
      effect: 'allow',
      reason: 'Reading local fixtures and examples is expected during simulation.',
      tools: ['read', 'file_fetch'],
      kinds: ['file.read'],
      paths: ['fixtures/**', 'examples/**', 'docs/**', 'README.md']
    },
    {
      id: 'deny-secret-files',
      effect: 'deny',
      reason: 'Secret-bearing files must not be read or written by default.',
      kinds: ['file.read', 'file.write'],
      paths: ['**/.env', '**/.env.*', '**/*secret*', '**/*token*']
    },
    {
      id: 'deny-destructive-shell',
      effect: 'deny',
      reason: 'Destructive shell commands need explicit human review.',
      tools: ['exec'],
      kinds: ['command.run'],
      commands: ['rm -rf *', 'rm -rf /**', 'sudo *', 'chmod -R 777 *']
    },
    {
      id: 'warn-network',
      effect: 'warn',
      reason: 'Network access is reviewable because AgentPermit is local-first.',
      kinds: ['network.request'],
      urls: ['http://**', 'https://**']
    },
    {
      id: 'deny-external-message',
      effect: 'deny',
      reason: 'Outbound messages can affect people and require approval.',
      tools: ['message'],
      kinds: ['message.send']
    }
  ]
};
