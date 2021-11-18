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
  Design,
  Step,
} from '../models';
import {DesignRepository} from '../repositories';

export class DesignStepController {
  constructor(
    @repository(DesignRepository) protected designRepository: DesignRepository,
  ) { }

  @get('/designs/{id}/steps', {
    responses: {
      '200': {
        description: 'Array of Design has many Step',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Step)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Step>,
  ): Promise<Step[]> {
    return this.designRepository.steps(id).find(filter);
  }

  @post('/designs/{id}/steps', {
    responses: {
      '200': {
        description: 'Design model instance',
        content: {'application/json': {schema: getModelSchemaRef(Step)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Design.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Step, {
            title: 'NewStepInDesign',
            exclude: ['id'],
            optional: ['designId']
          }),
        },
      },
    }) step: Omit<Step, 'id'>,
  ): Promise<Step> {
    return this.designRepository.steps(id).create(step);
  }

  @patch('/designs/{id}/steps', {
    responses: {
      '200': {
        description: 'Design.Step PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Step, {partial: true}),
        },
      },
    })
    step: Partial<Step>,
    @param.query.object('where', getWhereSchemaFor(Step)) where?: Where<Step>,
  ): Promise<Count> {
    return this.designRepository.steps(id).patch(step, where);
  }

  @del('/designs/{id}/steps', {
    responses: {
      '200': {
        description: 'Design.Step DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Step)) where?: Where<Step>,
  ): Promise<Count> {
    return this.designRepository.steps(id).delete(where);
  }
}
