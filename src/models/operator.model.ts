import {Entity, model, property, hasMany} from '@loopback/repository';
import {OperatorStep} from './operator-step.model';

@model()
export class Operator extends Entity {
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
  team?: string;

  @property({
    type: 'string',
  })
  type?: string;

  @property({
    type: 'boolean',
  })
  isQC?: boolean;

  @hasMany(() => OperatorStep)
  operatorSteps: OperatorStep[];

  constructor(data?: Partial<Operator>) {
    super(data);
  }
}

export interface OperatorRelations {
  // describe navigational properties here
}

export type OperatorWithRelations = Operator & OperatorRelations;
