import { sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/packages/plugins/database/primary/client';
import {
  createMeeting,
  deleteMeeting,
  getMeetingById,
  listMeetings,
  updateMeeting
} from '../services/meeting-service';

async function _cleanMeetings() {
  await db.execute(sql`DELETE FROM meeting`);
}

beforeEach(async () => {
  await _cleanMeetings();
});

afterAll(async () => {
  await _cleanMeetings();
});

describe('meeting-service (integration)', () => {
  describe('createMeeting', () => {
    it('inserts a row and returns it with generated uuid', async () => {
      const meeting = await createMeeting({
        transcriptOutput: { segments: [], transcriptionText: 'hello' },
        status: 'processing'
      });

      expect(meeting.id).toBeDefined();
      expect(meeting.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(meeting.title).toBe('Untitled Meeting');
      expect(meeting.status).toBe('processing');
      expect(meeting.transcriptOutput).toEqual({
        segments: [],
        transcriptionText: 'hello'
      });
      expect(meeting.createdAt).toBeInstanceOf(Date);
    });

    it('defaults status to processing', async () => {
      const meeting = await createMeeting({
        transcriptOutput: { text: 'test' }
      });

      expect(meeting.status).toBe('processing');
    });
  });

  describe('getMeetingById', () => {
    it('returns meeting when it exists', async () => {
      const created = await createMeeting({
        transcriptOutput: { text: 'find me' },
        status: 'processing'
      });

      const found = await getMeetingById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.transcriptOutput).toEqual({ text: 'find me' });
    });

    it('returns null for non-existent id', async () => {
      const found = await getMeetingById(
        '00000000-0000-0000-0000-000000000000'
      );
      expect(found).toBeNull();
    });
  });

  describe('updateMeeting', () => {
    it('updates fields and returns updated row', async () => {
      const created = await createMeeting({
        transcriptOutput: { text: 'original' },
        status: 'processing'
      });

      const updated = await updateMeeting(created.id, {
        title: 'Weekly Standup',
        summary: 'Discussed sprint goals',
        actionItems: [{ text: 'Review PR #42' }],
        status: 'ready'
      });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe('Weekly Standup');
      expect(updated!.summary).toBe('Discussed sprint goals');
      expect(updated!.actionItems).toEqual([{ text: 'Review PR #42' }]);
      expect(updated!.status).toBe('ready');
    });

    it('returns null when updating non-existent meeting', async () => {
      const result = await updateMeeting(
        '00000000-0000-0000-0000-000000000000',
        { status: 'ready' }
      );
      expect(result).toBeNull();
    });

    it('can set error message on failure', async () => {
      const created = await createMeeting({
        transcriptOutput: { text: 'fail' },
        status: 'processing'
      });

      const updated = await updateMeeting(created.id, {
        status: 'failed',
        errorMessage: 'API key invalid'
      });

      expect(updated!.status).toBe('failed');
      expect(updated!.errorMessage).toBe('API key invalid');
    });
  });

  describe('deleteMeeting', () => {
    it('removes meeting and returns deleted row', async () => {
      const created = await createMeeting({
        transcriptOutput: { text: 'delete me' },
        status: 'processing'
      });

      const deleted = await deleteMeeting(created.id);
      expect(deleted).not.toBeNull();
      expect(deleted!.id).toBe(created.id);

      const found = await getMeetingById(created.id);
      expect(found).toBeNull();
    });

    it('returns null when deleting non-existent meeting', async () => {
      const result = await deleteMeeting(
        '00000000-0000-0000-0000-000000000000'
      );
      expect(result).toBeNull();
    });
  });

  describe('listMeetings', () => {
    it('returns paginated results', async () => {
      await createMeeting({ transcriptOutput: { text: '1' } });
      await createMeeting({ transcriptOutput: { text: '2' } });
      await createMeeting({ transcriptOutput: { text: '3' } });

      const result = await listMeetings({ page: 1, pageSize: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(2);
    });

    it('returns second page', async () => {
      await createMeeting({ transcriptOutput: { text: '1' } });
      await createMeeting({ transcriptOutput: { text: '2' } });
      await createMeeting({ transcriptOutput: { text: '3' } });

      const result = await listMeetings({ page: 2, pageSize: 2 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(2);
    });

    it('sorts by createdAt desc by default', async () => {
      const m1 = await createMeeting({ transcriptOutput: { text: '1' } });
      const m2 = await createMeeting({ transcriptOutput: { text: '2' } });

      const result = await listMeetings();

      expect(result.data[0].id).toBe(m2.id);
      expect(result.data[1].id).toBe(m1.id);
    });

    it('sorts by title asc', async () => {
      await createMeeting({ transcriptOutput: { text: '1' } });
      const _updated1 = await updateMeeting((await listMeetings()).data[0].id, {
        title: 'Zebra Meeting'
      });
      await createMeeting({ transcriptOutput: { text: '2' } });
      const _updated2 = await updateMeeting((await listMeetings()).data[0].id, {
        title: 'Alpha Meeting'
      });

      const result = await listMeetings({
        sortBy: 'title',
        sortOrder: 'asc'
      });

      expect(result.data[0].title).toBe('Alpha Meeting');
    });

    it('filters by search term', async () => {
      await createMeeting({ transcriptOutput: { text: '1' } });
      const m = await createMeeting({ transcriptOutput: { text: '2' } });
      await updateMeeting(m.id, { title: 'Sprint Planning' });

      const result = await listMeetings({ search: 'sprint' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Sprint Planning');
    });

    it('returns empty results when no meetings exist', async () => {
      const result = await listMeetings();

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });
});
