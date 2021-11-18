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
import {Design} from '../models';
import {DesignRepository} from '../repositories';

export class DesignController {
  constructor(
    @repository(DesignRepository)
    public designRepository : DesignRepository,
  ) {}

  @post('/designs')
  @response(200, {
    description: 'Design model instance',
    content: {'application/json': {schema: getModelSchemaRef(Design)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Design, {
            title: 'NewDesign',
            exclude: ['id'],
          }),
        },
      },
    })
    design: Omit<Design, 'id'>,
  ): Promise<Design> {
    return this.designRepository.create(design);
  }

  @get('/designs/count')
  @response(200, {
    description: 'Design model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Design) where?: Where<Design>,
  ): Promise<Count> {
    return this.designRepository.count(where);
  }

  @get('/designs')
  @response(200, {
    description: 'Array of Design model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Design, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Design) filter?: Filter<Design>,
  ): Promise<Design[]> {
    return this.designRepository.find(filter);
  }

  @patch('/designs')
  @response(200, {
    description: 'Design PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Design, {partial: true}),
        },
      },
    })
    design: Design,
    @param.where(Design) where?: Where<Design>,
  ): Promise<Count> {
    return this.designRepository.updateAll(design, where);
  }

  @get('/designs/{id}')
  @response(200, {
    description: 'Design model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Design, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Design, {exclude: 'where'}) filter?: FilterExcludingWhere<Design>
  ): Promise<Design> {
    return this.designRepository.findById(id, filter);
  }

  @patch('/designs/{id}')
  @response(204, {
    description: 'Design PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Design, {partial: true}),
        },
      },
    })
    design: Design,
  ): Promise<void> {
    await this.designRepository.updateById(id, design);
  }

  @put('/designs/{id}')
  @response(204, {
    description: 'Design PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() design: Design,
  ): Promise<void> {
    await this.designRepository.replaceById(id, design);
  }

  @del('/designs/{id}')
  @response(204, {
    description: 'Design DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.designRepository.deleteById(id);
  }
}
