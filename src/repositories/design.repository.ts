import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Design, DesignRelations, Step} from '../models';
import {StepRepository} from './step.repository';

export class DesignRepository extends DefaultCrudRepository<
  Design,
  typeof Design.prototype.id,
  DesignRelations
> {

  public readonly steps: HasManyRepositoryFactory<Step, typeof Design.prototype.id>;

  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource, @repository.getter('StepRepository') protected stepRepositoryGetter: Getter<StepRepository>,
  ) {
    super(Design, dataSource);
    this.steps = this.createHasManyRepositoryFactoryFor('steps', stepRepositoryGetter,);
    this.registerInclusionResolver('steps', this.steps.inclusionResolver);
  }
}
