#!/usr/bin/env node
import { Command, InvalidArgumentError } from 'commander';
import { AgentPermitError } from './errors.js';
import { evaluate } from './evaluator.js';
import { formatEvaluation, formatExplain, type OutputFormat } from './format.js';
import { loadWorkspace, writeInitFiles } from './io.js';

const program = new Command();

program
  .name('agentpermit')
  .description('Local policy simulator for agent tool permissions.')
  .version('0.1.0');

program
  .command('init')
  .description('Create a sample policy and trace in a directory.')
  .argument('[target]', 'Directory to initialize', '.')
  .action(async (target: string) => {
    const result = await writeInitFiles(target);
    console.log(`Initialized AgentPermit workspace at ${result.target}`);
    for (const file of result.files) console.log(`- ${file}`);
  });

program
  .command('check')
  .description('Evaluate a trace against an AgentPermit policy.')
  .argument('[workspace]', 'Directory containing agentpermit.policy.json and agentpermit.trace.json', '.')
  .option('--policy <path>', 'Policy file override')
  .option('--trace <path>', 'Trace file override')
  .option('--format <format>', 'Output format: text or json', parseFormat, 'text')
  .action(async (workspace: string, options: { policy?: string; trace?: string; format: OutputFormat }) => {
    const input = await loadWorkspace(workspace, options.policy, options.trace);
    const evaluation = evaluate(input.policy, input.actions);
    process.stdout.write(formatEvaluation(evaluation, options.format));
    process.exitCode = evaluation.ok ? 0 : 1;
  });

program
  .command('explain')
  .description('Explain policy decisions as markdown.')
  .argument('[workspace]', 'Directory containing agentpermit policy and trace files', '.')
  .option('--policy <path>', 'Policy file override')
  .option('--trace <path>', 'Trace file override')
  .action(async (workspace: string, options: { policy?: string; trace?: string }) => {
    const input = await loadWorkspace(workspace, options.policy, options.trace);
    process.stdout.write(formatExplain(evaluate(input.policy, input.actions)));
  });

program
  .command('report')
  .description('Alias for check --format json, useful for automation.')
  .argument('[workspace]', 'Directory containing agentpermit policy and trace files', '.')
  .option('--policy <path>', 'Policy file override')
  .option('--trace <path>', 'Trace file override')
  .action(async (workspace: string, options: { policy?: string; trace?: string }) => {
    const input = await loadWorkspace(workspace, options.policy, options.trace);
    const evaluation = evaluate(input.policy, input.actions);
    process.stdout.write(formatEvaluation(evaluation, 'json'));
    process.exitCode = evaluation.ok ? 0 : 1;
  });

program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error) {
  if (error instanceof AgentPermitError) {
    console.error(`agentpermit: ${error.message}`);
    process.exit(error.exitCode);
  }
  if (error instanceof InvalidArgumentError) {
    console.error(`agentpermit: ${error.message}`);
    process.exit(2);
  }
  if (error && typeof error === 'object' && 'code' in error && String(error.code).startsWith('commander.')) {
    if (error.code === 'commander.helpDisplayed' || error.code === 'commander.version') {
      process.exit(0);
    }
    process.exit(2);
  }
  throw error;
}

function parseFormat(value: string): OutputFormat {
  if (value === 'text' || value === 'json') return value;
  throw new InvalidArgumentError('format must be text or json');
}
