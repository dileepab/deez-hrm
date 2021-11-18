import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {OperatorStep} from '../models';
import {OperatorStepRepository} from '../repositories';

export class OperatorStepController {
  constructor(
    @repository(OperatorStepRepository)
    public operatorStepRepository : OperatorStepRepository,
  ) {}

  @post('/operator-steps')
  @response(200, {
    description: 'OperatorStep model instance',
    content: {'application/json': {schema: getModelSchemaRef(OperatorStep)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OperatorStep, {
            title: 'NewOperatorStep',
            exclude: ['id'],
          }),
        },
      },
    })
    operatorStep: Omit<OperatorStep, 'id'>,
  ): Promise<OperatorStep> {
    return this.operatorStepRepository.create(operatorStep);
  }

  @get('/operator-steps/count')
  @response(200, {
    description: 'OperatorStep model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(OperatorStep) where?: Where<OperatorStep>,
  ): Promise<Count> {
    return this.operatorStepRepository.count(where);
  }

  @get('/operator-steps')
  @response(200, {
    description: 'Array of OperatorStep model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(OperatorStep, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(OperatorStep) filter?: Filter<OperatorStep>,
  ): Promise<OperatorStep[]> {
    return this.operatorStepRepository.find(filter);
  }

  @patch('/operator-steps')
  @response(200, {
    description: 'OperatorStep PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OperatorStep, {partial: true}),
        },
      },
    })
    operatorStep: OperatorStep,
    @param.where(OperatorStep) where?: Where<OperatorStep>,
  ): Promise<Count> {
    return this.operatorStepRepository.updateAll(operatorStep, where);
  }

  @get('/operator-steps/{id}')
  @response(200, {
    description: 'OperatorStep model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(OperatorStep, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(OperatorStep, {exclude: 'where'}) filter?: FilterExcludingWhere<OperatorStep>
  ): Promise<OperatorStep> {
    return this.operatorStepRepository.findById(id, filter);
  }

  @patch('/operator-steps/{id}')
  @response(204, {
    description: 'OperatorStep PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OperatorStep, {partial: true}),
        },
      },
    })
    operatorStep: OperatorStep,
  ): Promise<void> {
    await this.operatorStepRepository.updateById(id, operatorStep);
  }

  @put('/operator-steps/{id}')
  @response(204, {
    description: 'OperatorStep PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() operatorStep: OperatorStep,
  ): Promise<void> {
    await this.operatorStepRepository.replaceById(id, operatorStep);
  }

  @del('/operator-steps/{id}')
  @response(204, {
    description: 'OperatorStep DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.operatorStepRepository.deleteById(id);
  }
}
