import {Entity, model, property} from '@loopback/repository';

@model()
export class Settings extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  qcPrice: number;

  @property({
    type: 'number',
    required: true,
  })
  perKMPrice: number;

  @property({
    type: 'number',
    required: true,
  })
  maxTransportAmount: number;

  @property({
    type: 'boolean',
    required: true,
  })
  isTransportEnable: boolean;

  @property({
    type: 'number',
    required: true,
  })
  qcSalary: number;

  @property({
    type: 'array',
    itemType: 'string',
  })
  brands?: string[];


  constructor(data?: Partial<Settings>) {
    super(data);
  }
}

export interface SettingsRelations {
  // describe navigational properties here
}

export type SettingsWithRelations = Settings & SettingsRelations;
