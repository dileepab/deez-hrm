import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {Design} from './design.model';
import {OperatorStep} from './operator-step.model';

@model()
export class Step extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'estimated_time'
    }
  })
  estimatedTime?: number;

  @belongsTo(() => Design)
  designId: number;

  @hasMany(() => OperatorStep)
  operatorSteps: OperatorStep[];

  constructor(data?: Partial<Step>) {
    super(data);
  }
}

export interface StepRelations {
  // describe navigational properties here
}

export type StepWithRelations = Step & StepRelations;
