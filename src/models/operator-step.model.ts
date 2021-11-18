import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Operator} from './operator.model';
import {Step} from './step.model';

@model()
export class OperatorStep extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  quantity?: number;

  @property({
    type: 'Date',
    postgresql: {
      columnName: 'complete_time'
    }
  })
  completeTime?: Date;

  @belongsTo(() => Operator)
  operatorId: number;

  @belongsTo(() => Step)
  stepId: number;

  constructor(data?: Partial<OperatorStep>) {
    super(data);
  }
}

export interface OperatorStepRelations {
  // describe navigational properties here
}

export type OperatorStepWithRelations = OperatorStep & OperatorStepRelations;
