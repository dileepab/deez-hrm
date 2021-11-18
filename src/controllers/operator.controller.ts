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
import {Operator} from '../models';
import {OperatorRepository} from '../repositories';

export class OperatorController {
  constructor(
    @repository(OperatorRepository)
    public operatorRepository : OperatorRepository,
  ) {}

  @post('/operators')
  @response(200, {
    description: 'Operator model instance',
    content: {'application/json': {schema: getModelSchemaRef(Operator)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Operator, {
            title: 'NewOperator',
            exclude: ['id'],
          }),
        },
      },
    })
    operator: Omit<Operator, 'id'>,
  ): Promise<Operator> {
    return this.operatorRepository.create(operator);
  }

  @get('/operators/count')
  @response(200, {
    description: 'Operator model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Operator) where?: Where<Operator>,
  ): Promise<Count> {
    return this.operatorRepository.count(where);
  }

  @get('/operators')
  @response(200, {
    description: 'Array of Operator model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Operator, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Operator) filter?: Filter<Operator>,
  ): Promise<Operator[]> {
    return this.operatorRepository.find(filter);
  }

  @patch('/operators')
  @response(200, {
    description: 'Operator PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Operator, {partial: true}),
        },
      },
    })
    operator: Operator,
    @param.where(Operator) where?: Where<Operator>,
  ): Promise<Count> {
    return this.operatorRepository.updateAll(operator, where);
  }

  @get('/operators/{id}')
  @response(200, {
    description: 'Operator model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Operator, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Operator, {exclude: 'where'}) filter?: FilterExcludingWhere<Operator>
  ): Promise<Operator> {
    return this.operatorRepository.findById(id, filter);
  }

  @patch('/operators/{id}')
  @response(204, {
    description: 'Operator PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Operator, {partial: true}),
        },
      },
    })
    operator: Operator,
  ): Promise<void> {
    await this.operatorRepository.updateById(id, operator);
  }

  @put('/operators/{id}')
  @response(204, {
    description: 'Operator PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() operator: Operator,
  ): Promise<void> {
    await this.operatorRepository.replaceById(id, operator);
  }

  @del('/operators/{id}')
  @response(204, {
    description: 'Operator DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.operatorRepository.deleteById(id);
  }
}
