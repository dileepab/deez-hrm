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
  Step,
  OperatorStep,
} from '../models';
import {StepRepository} from '../repositories';

export class StepOperatorStepController {
  constructor(
    @repository(StepRepository) protected stepRepository: StepRepository,
  ) { }

  @get('/steps/{id}/operator-steps', {
    responses: {
      '200': {
        description: 'Array of Step has many OperatorStep',
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
    return this.stepRepository.operatorSteps(id).find(filter);
  }

  @post('/steps/{id}/operator-steps', {
    responses: {
      '200': {
        description: 'Step model instance',
        content: {'application/json': {schema: getModelSchemaRef(OperatorStep)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Step.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OperatorStep, {
            title: 'NewOperatorStepInStep',
            exclude: ['id'],
            optional: ['stepId']
          }),
        },
      },
    }) operatorStep: Omit<OperatorStep, 'id'>,
  ): Promise<OperatorStep> {
    return this.stepRepository.operatorSteps(id).create(operatorStep);
  }

  @patch('/steps/{id}/operator-steps', {
    responses: {
      '200': {
        description: 'Step.OperatorStep PATCH success count',
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
    return this.stepRepository.operatorSteps(id).patch(operatorStep, where);
  }

  @del('/steps/{id}/operator-steps', {
    responses: {
      '200': {
        description: 'Step.OperatorStep DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(OperatorStep)) where?: Where<OperatorStep>,
  ): Promise<Count> {
    return this.stepRepository.operatorSteps(id).delete(where);
  }
}
