import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Operator,
  OperatorStep,
} from '../models';
import {OperatorRepository} from '../repositories';

export class OperatorOperatorStepController {
  constructor(
    @repository(OperatorRepository) protected operatorRepository: OperatorRepository,
  ) { }

  @get('/operators/{id}/operator-steps', {
    responses: {
      '200': {
        description: 'Array of Operator has many OperatorStep',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(OperatorStep)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<OperatorStep>,
  ): Promise<OperatorStep[]> {
    return this.operatorRepository.operatorSteps(id).find(filter);
  }

  @post('/operators/{id}/operator-steps', {
    responses: {
      '200': {
        description: 'Operator model instance',
        content: {'application/json': {schema: getModelSchemaRef(OperatorStep)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Operator.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OperatorStep, {
            title: 'NewOperatorStepInOperator',
            exclude: ['id'],
            optional: ['operatorId']
          }),
        },
      },
    }) operatorStep: Omit<OperatorStep, 'id'>,
  ): Promise<OperatorStep> {
    return this.operatorRepository.operatorSteps(id).create(operatorStep);
  }

  @patch('/operators/{id}/operator-steps', {
    responses: {
      '200': {
        description: 'Operator.OperatorStep PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OperatorStep, {partial: true}),
        },
      },
    })
    operatorStep: Partial<OperatorStep>,
    @param.query.object('where', getWhereSchemaFor(OperatorStep)) where?: Where<OperatorStep>,
  ): Promise<Count> {
    return this.operatorRepository.operatorSteps(id).patch(operatorStep, where);
  }

  @del('/operators/{id}/operator-steps', {
    responses: {
      '200': {
        description: 'Operator.OperatorStep DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(OperatorStep)) where?: Where<OperatorStep>,
  ): Promise<Count> {
    return this.operatorRepository.operatorSteps(id).delete(where);
  }
}
