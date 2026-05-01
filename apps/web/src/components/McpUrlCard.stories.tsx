import type { Meta, StoryObj } from '@storybook/react';
import { McpUrlCard } from './McpUrlCard';

const meta: Meta<typeof McpUrlCard> = {
  component: McpUrlCard,
  title: 'McpUrlCard',
};

export default meta;
type Story = StoryObj<typeof McpUrlCard>;

export const Default: Story = {
  args: {
    mcpUrl: 'http://localhost:3301/mcp/018f3e1a-1234-7abc-8def-0123456789ab',
    onCopy: () => {
      alert('Copied!');
    },
  },
};
