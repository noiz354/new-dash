import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { listWoTasks, updateWoTask } from '@/lib/services/task-service';

const UpdateTaskSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']),
});

/** GET /api/work-orders/[id]/tasks — list DB-driven checklist tasks */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withRoute({ op: 'wo.tasks.list', method: 'GET', permission: 'wo.read' }, req, async (ctx) => {
    const tasks = await listWoTasks(getDb(), ctx!, id);
    return { data: tasks };
  });
}

/** POST /api/work-orders/[id]/tasks — update task status with sequence & photo gates */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withRoute({ op: 'wo.tasks.update', method: 'POST', permission: 'wo.transition' }, req, async (ctx) => {
    const body = await req.json();
    const input = UpdateTaskSchema.parse(body);
    const updated = await updateWoTask(getDb(), ctx!, {
      taskId: input.taskId,
      woNumber: id,
      status: input.status,
    });
    return { data: updated };
  });
}
