import axios from 'axios';

const BITRIX24_WEBHOOK_URL = process.env.BITRIX24_WEBHOOK_URL?.replace(/\/$/, '');

if (!BITRIX24_WEBHOOK_URL) {
  console.warn('BITRIX24_WEBHOOK_URL is not set. Bitrix24 integration will not work.');
}

interface BitrixDeal {
  ID: string;
  TITLE: string;
  OPPORTUNITY: string;
  CURRENCY_ID: string;
  ASSIGNED_BY_ID: string;
  COMMENTS: string;
}

interface BitrixTask {
  id: string;
  title: string;
  description: string;
  responsibleId: string;
  status: string;
}

export const searchBitrix = async (query: string): Promise<{ deals: BitrixDeal[], tasks: BitrixTask[] }> => {
  if (!BITRIX24_WEBHOOK_URL) {
    return { deals: [], tasks: [] };
  }

  try {
    const dealSearchPromise = axios.post(`${BITRIX24_WEBHOOK_URL}/crm.deal.list`,
      {
        order: { 'ID': 'DESC' },
        select: ["ID", "TITLE", "OPPORTUNITY", "CURRENCY_ID", "ASSIGNED_BY_ID", "COMMENTS"]
      }
    );

    const taskSearchPromise = axios.post(`${BITRIX24_WEBHOOK_URL}/tasks.task.list`,
      {
        order: {
          ID: 'desc',
        },
        select: ["ID", "TITLE", "DESCRIPTION", "RESPONSIBLE_ID", "STATUS"]
      }
    );

    const [dealResponse, taskResponse] = await Promise.all([dealSearchPromise, taskSearchPromise]);

    const deals = dealResponse.data.result || [];
    const tasks = (taskResponse.data.result.tasks || []).map((task: any) => ({
      id: task.ID,
      title: task.TITLE,
      description: task.DESCRIPTION,
      responsibleId: task.RESPONSIBLE_ID,
      status: task.STATUS
    }));

    console.log('DEBUG: Fetching recent deals and tasks, ignoring query:', query);
    console.log(`DEBUG: Found ${deals.length} recent deals.`);
    console.log(`DEBUG: Found ${tasks.length} recent tasks.`);

    return { deals, tasks };
  } catch (error) {
    console.error('Error searching Bitrix24:', error);
    return { deals: [], tasks: [] };
  }
};
