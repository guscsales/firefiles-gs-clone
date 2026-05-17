import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockSelect, mockInsert, mockUpdate, mockDelete } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn()
}));

vi.mock('@/env', () => ({
  env: { DATABASE_URL: 'postgres://test' }
}));

vi.mock('@/packages/plugins/database/primary/client', () => {
  const _chainable = (terminal: vi.Mock) => {
    const chain: Record<string, vi.Mock> = {};
    const methods = [
      'select',
      'from',
      'where',
      'orderBy',
      'limit',
      'offset',
      'insert',
      'values',
      'update',
      'set',
      'delete',
      'returning'
    ];
    for (const m of methods) {
      chain[m] = vi.fn().mockReturnValue(chain);
    }
    chain.returning = terminal;
    chain.from = vi.fn().mockReturnValue(chain);
    chain.where = vi.fn().mockReturnValue(chain);
    chain.orderBy = vi.fn().mockReturnValue(chain);
    chain.limit = vi.fn().mockReturnValue(chain);
    chain.offset = vi.fn().mockReturnValue(chain);
    chain.values = vi.fn().mockReturnValue(chain);
    chain.set = vi.fn().mockReturnValue(chain);
    return chain;
  };

  const selectChain = _chainable(vi.fn());
  const insertChain = _chainable(vi.fn());
  const updateChain = _chainable(vi.fn());
  const deleteChain = _chainable(vi.fn());

  mockSelect.mockReturnValue(selectChain);
  mockInsert.mockReturnValue(insertChain);
  mockUpdate.mockReturnValue(updateChain);
  mockDelete.mockReturnValue(deleteChain);

  return {
    db: {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    }
  };
});

vi.mock('@/packages/plugins/database/primary/schemas', () => ({
  meetings: {
    id: 'id',
    title: 'title',
    createdAt: 'created_at',
    status: 'status',
    transcriptOutput: 'transcript_output',
    summary: 'summary',
    actionItems: 'action_items',
    errorMessage: 'error_message'
  }
}));

import {
  createMeeting,
  deleteMeeting,
  getMeetingById,
  updateMeeting
} from '../services/meeting-service';

describe('meeting-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMeetingById', () => {
    it('returns meeting when found', async () => {
      const meeting = { id: 'abc', title: 'Test' };
      const chain = mockSelect();
      chain.from().where.mockResolvedValueOnce([meeting]);

      const result = await getMeetingById('abc');
      expect(result).toEqual(meeting);
    });

    it('returns null when not found', async () => {
      const chain = mockSelect();
      chain.from().where.mockResolvedValueOnce([]);

      const result = await getMeetingById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('createMeeting', () => {
    it('calls insert with params and returns meeting', async () => {
      const meeting = { id: 'new-id', status: 'processing' };
      const chain = mockInsert();
      chain.values().returning.mockResolvedValueOnce([meeting]);

      const result = await createMeeting({
        transcriptOutput: { text: 'hello' },
        status: 'processing'
      });
      expect(result).toEqual(meeting);
    });
  });

  describe('updateMeeting', () => {
    it('returns updated meeting', async () => {
      const meeting = { id: 'abc', status: 'ready' };
      const chain = mockUpdate();
      chain.set().where().returning.mockResolvedValueOnce([meeting]);

      const result = await updateMeeting('abc', { status: 'ready' });
      expect(result).toEqual(meeting);
    });

    it('returns null when meeting not found', async () => {
      const chain = mockUpdate();
      chain.set().where().returning.mockResolvedValueOnce([]);

      const result = await updateMeeting('nonexistent', { status: 'ready' });
      expect(result).toBeNull();
    });
  });

  describe('deleteMeeting', () => {
    it('returns deleted meeting', async () => {
      const meeting = { id: 'abc', title: 'Deleted' };
      const chain = mockDelete();
      chain.from().where().returning.mockResolvedValueOnce([meeting]);

      const result = await deleteMeeting('abc');
      expect(result).toEqual(meeting);
    });

    it('returns null when meeting not found', async () => {
      const chain = mockDelete();
      chain.from().where().returning.mockResolvedValueOnce([]);

      const result = await deleteMeeting('nonexistent');
      expect(result).toBeNull();
    });
  });
});
