import { asc, desc, eq, ilike, sql } from 'drizzle-orm';
import { db } from '@/packages/plugins/database/primary/client';
import { meetings } from '@/packages/plugins/database/primary/schemas';

type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type ListMeetingsParams = {
  page?: number;
  pageSize?: number;
  sortBy?: 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
};

type CreateMeetingParams = {
  title: string;
};

type UpdateMeetingParams = {
  title?: string;
  transcriptOutput?: unknown;
  summary?: string;
  actionItems?: unknown;
  status?: 'recording' | 'processing' | 'ready' | 'failed';
  errorMessage?: string;
};

const sortColumns = {
  title: meetings.title,
  createdAt: meetings.createdAt
} as const;

export async function listMeetings(
  params: ListMeetingsParams = {}
): Promise<PaginatedResult<typeof meetings.$inferSelect>> {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search
  } = params;

  const offset = (page - 1) * pageSize;
  const sortColumn = sortColumns[sortBy];
  const orderFn = sortOrder === 'asc' ? asc : desc;

  const where = search ? ilike(meetings.title, `%${search}%`) : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(meetings)
      .where(where)
      .orderBy(orderFn(sortColumn))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(meetings).where(where)
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

export async function getMeetingById(id: string) {
  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
  return meeting ?? null;
}

export async function createMeeting(params: CreateMeetingParams) {
  const [meeting] = await db.insert(meetings).values(params).returning();
  return meeting;
}

export async function updateMeeting(id: string, params: UpdateMeetingParams) {
  const [meeting] = await db
    .update(meetings)
    .set(params)
    .where(eq(meetings.id, id))
    .returning();
  return meeting ?? null;
}

export async function deleteMeeting(id: string) {
  const [meeting] = await db
    .delete(meetings)
    .where(eq(meetings.id, id))
    .returning();
  return meeting ?? null;
}
