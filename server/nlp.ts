import { generateBusinessResponse } from './openai';
import { generateLocalBusinessResponse } from './localAI';

// Intent recognition patterns
const INTENT_PATTERNS = {
  CREATE_BOT: [
    /(?:create|make|build|generate)\s+(?:a\s+)?bot/i,
    /(?:want|need)\s+(?:a\s+)?bot/i,
    /bot\s+(?:that|which|to)/i,
    /хочу\s+бота/i,
    /создай\s+бота/i,
    /сделай\s+бота/i
  ],
  SCHEDULE_TRIGGER: [
    /every\s+day/i,
    /daily/i,
    /каждый\s+день/i,
    /ежедневно/i,
    /по\s+времени/i,
    /в\s+\d{1,2}:\d{2}/i,
    /at\s+\d{1,2}:\d{2}/i
  ],
  DATA_SOURCE: [
    /from\s+(crm|bitrix|notion|excel|gmail|slack)/i,
    /из\s+(crm|битрикс|notion|excel|gmail|slack)/i,
    /data\s+from/i,
    /данные\s+из/i
  ],
  OUTPUT_ACTION: [
    /send\s+to\s+(telegram|slack|email)/i,
    /отправ\w+\s+в\s+(telegram|slack|email)/i,
    /report\s+to/i,
    /отчет\s+в/i
  ],
  METRICS: [
    /count|количество/i,
    /sales|продажи/i,
    /leads|заявки/i,
    /revenue|доход/i,
    /kpi/i
  ]
};

// Entity extraction patterns
const ENTITY_PATTERNS = {
  TIME: [
    /(\d{1,2}):(\d{2})/g,
    /(утром|вечером|днем)/gi,
    /(morning|evening|afternoon)/gi
  ],
  INTEGRATION: [
    /(bitrix24|crm|notion|excel|gmail|slack|telegram|trello)/gi,
    /(битрикс|эксель|слак|телеграм)/gi
  ],
  FREQUENCY: [
    /(daily|weekly|monthly|ежедневно|еженедельно|ежемесячно)/gi,
    /(каждый\s+день|каждую\s+неделю|каждый\s+месяц)/gi
  ],
  METRIC_TYPE: [
    /(leads|sales|revenue|customers|заявки|продажи|доход|клиенты)/gi,
    /(count|sum|average|количество|сумма|среднее)/gi
  ]
};

export interface BotIntent {
  type: 'CREATE_BOT' | 'MODIFY_BOT' | 'DELETE_BOT' | 'EXPLAIN_BOT';
  confidence: number;
  entities: {
    trigger?: {
      type: 'schedule' | 'webhook' | 'manual';
      schedule?: string;
      frequency?: string;
    };
    dataSource?: {
      integration: string;
      filters?: string[];
    };
    actions?: {
      type: 'send_message' | 'create_report' | 'update_data';
      target: string;
      format?: string;
    };
    metrics?: {
      type: string;
      aggregation?: string;
      timeframe?: string;
    };
  };
  rawText: string;
}

export interface BotWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'schedule' | 'webhook' | 'manual';
    config: any;
  };
  steps: BotWorkflowStep[];
  isActive: boolean;
  createdAt: Date;
  lastRun?: Date;
}

export interface BotWorkflowStep {
  id: string;
  type: 'fetch_data' | 'process_data' | 'send_notification' | 'conditional';
  config: any;
  nextSteps?: string[];
}

export class NLPProcessor {
  
  /**
   * Extract intent from natural language text
   */
  extractIntent(text: string): BotIntent {
    const normalizedText = text.toLowerCase().trim();
    
    // Check for bot creation intent
    const hasCreateIntent = INTENT_PATTERNS.CREATE_BOT.some(pattern => 
      pattern.test(normalizedText)
    );
    
    if (!hasCreateIntent) {
      return {
        type: 'EXPLAIN_BOT',
        confidence: 0.3,
        entities: {},
        rawText: text
      };
    }

    // Extract entities
    const entities: BotIntent['entities'] = {};
    
    // Extract trigger information
    if (INTENT_PATTERNS.SCHEDULE_TRIGGER.some(pattern => pattern.test(normalizedText))) {
      const timeMatch = normalizedText.match(/(\d{1,2}):(\d{2})/);
      const frequencyMatch = normalizedText.match(/(daily|ежедневно|каждый\s+день)/i);
      
      entities.trigger = {
        type: 'schedule' as const,
        schedule: timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : '09:00',
        frequency: frequencyMatch ? 'daily' : 'daily'
      };
    }

    // Extract data source
    const integrationMatch = normalizedText.match(/(bitrix24|crm|notion|excel|gmail|slack|битрикс)/i);
    if (integrationMatch) {
      entities.dataSource = {
        integration: integrationMatch[1].toLowerCase() === 'битрикс' ? 'bitrix24' : integrationMatch[1].toLowerCase(),
        filters: this.extractFilters(normalizedText)
      };
    }

    // Extract output actions
    const outputMatch = normalizedText.match(/(telegram|slack|email|телеграм|слак)/i);
    if (outputMatch) {
      entities.actions = {
        type: 'send_message',
        target: outputMatch[1].toLowerCase() === 'телеграм' ? 'telegram' : outputMatch[1].toLowerCase(),
        format: normalizedText.includes('report') || normalizedText.includes('отчет') ? 'report' : 'message'
      };
    }

    // Extract metrics
    const metricMatch = normalizedText.match(/(leads|sales|revenue|заявки|продажи|доход)/i);
    if (metricMatch) {
      entities.metrics = {
        type: metricMatch[1].toLowerCase(),
        aggregation: normalizedText.includes('count') || normalizedText.includes('количество') ? 'count' : 'sum',
        timeframe: normalizedText.includes('yesterday') || normalizedText.includes('вчера') ? 'yesterday' : 'today'
      };
    }

    return {
      type: 'CREATE_BOT',
      confidence: 0.85,
      entities,
      rawText: text
    };
  }

  /**
   * Extract filters from text
   */
  private extractFilters(text: string): string[] {
    const filters = [];
    
    if (text.includes('new') || text.includes('нов')) {
      filters.push('status:new');
    }
    
    if (text.includes('yesterday') || text.includes('вчера')) {
      filters.push('date:yesterday');
    }
    
    if (text.includes('manager') || text.includes('менеджер')) {
      filters.push('assigned_user');
    }

    return filters;
  }

  /**
   * Generate bot workflow from intent
   */
  generateWorkflow(intent: BotIntent): BotWorkflow {
    const workflowId = `bot_${Date.now()}`;
    const steps: BotWorkflowStep[] = [];

    // Add data fetching step
    if (intent.entities.dataSource) {
      steps.push({
        id: `fetch_${workflowId}`,
        type: 'fetch_data',
        config: {
          source: intent.entities.dataSource.integration,
          filters: intent.entities.dataSource.filters || [],
          fields: this.getRequiredFields(intent.entities.metrics)
        }
      });
    }

    // Add data processing step
    if (intent.entities.metrics) {
      steps.push({
        id: `process_${workflowId}`,
        type: 'process_data',
        config: {
          aggregation: intent.entities.metrics.aggregation,
          groupBy: intent.entities.metrics.type,
          timeframe: intent.entities.metrics.timeframe
        }
      });
    }

    // Add notification step
    if (intent.entities.actions) {
      steps.push({
        id: `notify_${workflowId}`,
        type: 'send_notification',
        config: {
          target: intent.entities.actions.target,
          format: intent.entities.actions.format,
          template: this.generateMessageTemplate(intent)
        }
      });
    }

    return {
      id: workflowId,
      name: this.generateBotName(intent),
      description: this.generateBotDescription(intent),
      trigger: {
        type: intent.entities.trigger?.type || 'manual',
        config: {
          schedule: intent.entities.trigger?.schedule,
          frequency: intent.entities.trigger?.frequency
        }
      },
      steps,
      isActive: false,
      createdAt: new Date()
    };
  }

  /**
   * Generate AI explanation of the bot workflow
   */
  async generateBotExplanation(workflow: BotWorkflow): Promise<string> {
    const prompt = `
Explain this bot workflow in simple terms:

Bot Name: ${workflow.name}
Description: ${workflow.description}

Trigger: ${workflow.trigger.type} - ${JSON.stringify(workflow.trigger.config)}

Steps:
${workflow.steps.map((step, index) => 
  `${index + 1}. ${step.type}: ${JSON.stringify(step.config)}`
).join('\n')}

Provide a clear, user-friendly explanation of what this bot does and how it works.
`;

    try {
      // Try OpenAI first, fallback to local processing
      const response = await generateBusinessResponse(prompt, {
        metrics: [],
        salesData: [],
        teamPerformance: [],
        topCustomers: [],
        recentActivities: []
      });
      return response;
    } catch (error) {
      return this.generateLocalExplanation(workflow);
    }
  }

  /**
   * Suggest bot improvements based on usage patterns
   */
  suggestImprovements(workflow: BotWorkflow, userFeedback?: string): string[] {
    const suggestions = [];

    // Analyze trigger frequency
    if (workflow.trigger.type === 'schedule' && workflow.trigger.config.frequency === 'daily') {
      suggestions.push("Consider adding a filter by manager to get more specific data");
    }

    // Analyze data sources
    const hasDataSource = workflow.steps.some(step => step.type === 'fetch_data');
    if (!hasDataSource) {
      suggestions.push("Add a data source to make your bot more useful");
    }

    // Analyze output format
    const hasNotification = workflow.steps.some(step => step.type === 'send_notification');
    if (!hasNotification) {
      suggestions.push("Add a notification method to receive bot updates");
    }

    // User feedback based suggestions
    if (userFeedback) {
      if (userFeedback.includes('too often') || userFeedback.includes('слишком часто')) {
        suggestions.push("Change frequency from daily to weekly");
      }
      if (userFeedback.includes('more details') || userFeedback.includes('больше деталей')) {
        suggestions.push("Add additional metrics like conversion rate or deal value");
      }
    }

    return suggestions;
  }

  private getRequiredFields(metrics?: BotIntent['entities']['metrics']): string[] {
    if (!metrics) return ['id', 'title', 'created_date'];
    
    const fields = ['id', 'title', 'created_date'];
    
    if (metrics.type.includes('sales') || metrics.type.includes('продажи')) {
      fields.push('opportunity', 'stage_id', 'assigned_by_id');
    }
    
    if (metrics.type.includes('revenue') || metrics.type.includes('доход')) {
      fields.push('opportunity', 'currency_id');
    }

    return fields;
  }

  private generateBotName(intent: BotIntent): string {
    const action = intent.entities.actions?.target || 'notification';
    const metric = intent.entities.metrics?.type || 'data';
    const source = intent.entities.dataSource?.integration || 'system';
    
    return `${metric} ${action} from ${source}`.replace(/\b\w/g, l => l.toUpperCase());
  }

  private generateBotDescription(intent: BotIntent): string {
    const parts = [];
    
    if (intent.entities.trigger?.frequency) {
      parts.push(`Runs ${intent.entities.trigger.frequency}`);
    }
    
    if (intent.entities.dataSource) {
      parts.push(`fetches data from ${intent.entities.dataSource.integration}`);
    }
    
    if (intent.entities.metrics) {
      parts.push(`calculates ${intent.entities.metrics.type} metrics`);
    }
    
    if (intent.entities.actions) {
      parts.push(`sends results to ${intent.entities.actions.target}`);
    }

    return parts.join(', ') || 'Custom bot workflow';
  }

  private generateMessageTemplate(intent: BotIntent): string {
    const metric = intent.entities.metrics?.type || 'data';
    const timeframe = intent.entities.metrics?.timeframe || 'today';
    
    return `📊 ${metric.charAt(0).toUpperCase() + metric.slice(1)} Report for ${timeframe}:\n\nTotal: {{count}}\nDetails: {{details}}\n\nGenerated by Oraclio Bot`;
  }

  private generateLocalExplanation(workflow: BotWorkflow): string {
    return `This bot "${workflow.name}" will ${workflow.description}. It's set to run ${workflow.trigger.type === 'schedule' ? 'automatically on schedule' : 'manually'} and will execute ${workflow.steps.length} steps to complete its task.`;
  }
}

export const nlpProcessor = new NLPProcessor();