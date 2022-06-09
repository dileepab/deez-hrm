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
  fullName?: string;

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

  @property({
    type: 'string',
  })
  nationalId?: string;

  @property({
    type: 'string',
  })
  bank?: string;

  @property({
    type: 'string',
  })
  bankAccount?: string;

  @property({
    type: 'string',
  })
  distance?: string;

  @property({
    type: 'Date',
  })
  startDate?: Date;

  @property({
    type: 'Date',
  })
  resignDate?: Date;

  @property({
    type: 'boolean',
  })
  isResigned?: boolean;

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
