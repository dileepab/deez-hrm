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
import {Step} from '../models';
import {StepRepository} from '../repositories';

export class StepController {
  constructor(
    @repository(StepRepository)
    public stepRepository : StepRepository,
  ) {}

  @post('/steps')
  @response(200, {
    description: 'Step model instance',
    content: {'application/json': {schema: getModelSchemaRef(Step)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Step, {
            title: 'NewStep',
            exclude: ['id'],
          }),
        },
      },
    })
    step: Omit<Step, 'id'>,
  ): Promise<Step> {
    return this.stepRepository.create(step);
  }

  @post('/steps-multi')
  @response(200, {
    description: 'Step model instance',
    content: {'application/json': {schema: getModelSchemaRef(Step)}},
  })
  async createAll(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Step, {
              title: 'NewStep',
              exclude: ['id'],
            }),
          }
        },
      },
    })
      steps: [Omit<Step, 'id'>],
  ): Promise<{}> {
    console.log(steps);
    steps.forEach(item => this.stepRepository.create(item))
    // return await this.stepRepository.createAll(steps);
    return steps;
  }

  @get('/steps/count')
  @response(200, {
    description: 'Step model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Step) where?: Where<Step>,
  ): Promise<Count> {
    return this.stepRepository.count(where);
  }

  @get('/steps')
  @response(200, {
    description: 'Array of Step model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Step, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Step) filter?: Filter<Step>,
  ): Promise<Step[]> {
    return this.stepRepository.find(filter);
  }

  @patch('/steps')
  @response(200, {
    description: 'Step PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Step, {partial: true}),
        },
      },
    })
    step: Step,
    @param.where(Step) where?: Where<Step>,
  ): Promise<Count> {
    return this.stepRepository.updateAll(step, where);
  }

  @get('/steps/{id}')
  @response(200, {
    description: 'Step model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Step, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Step, {exclude: 'where'}) filter?: FilterExcludingWhere<Step>
  ): Promise<Step> {
    return this.stepRepository.findById(id, filter);
  }

  @patch('/steps/{id}')
  @response(204, {
    description: 'Step PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Step, {partial: true}),
        },
      },
    })
    step: Step,
  ): Promise<void> {
    await this.stepRepository.updateById(id, step);
  }

  @put('/steps/{id}')
  @response(204, {
    description: 'Step PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() step: Step,
  ): Promise<void> {
    await this.stepRepository.replaceById(id, step);
  }

  @del('/steps/{id}')
  @response(204, {
    description: 'Step DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.stepRepository.deleteById(id);
  }
}
