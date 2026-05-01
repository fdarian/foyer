import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

async function main() {
  const mcpUuid = process.argv[2];
  if (!mcpUuid) {
    console.error('Usage: bun run test-smoke.ts <mcp-uuid>');
    process.exit(1);
  }

  const transport = new StreamableHTTPClientTransport(
    new URL(`http://localhost:3301/mcp/${mcpUuid}`),
  );
  const client = new Client({ name: 'test', version: '1.0.0' });
  await client.connect(transport);

  console.log('=== tools/list ===');
  const tools = await client.listTools();
  console.log(JSON.stringify(tools, null, 2));

  console.log('=== tools/call ===');
  const result = await client.callTool({
    name: 'getPetById',
    arguments: { petId: 1 },
  });
  console.log(JSON.stringify(result, null, 2));

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
