import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Step, StepRelations, OperatorStep} from '../models';
import {OperatorStepRepository} from './operator-step.repository';

export class StepRepository extends DefaultCrudRepository<
  Step,
  typeof Step.prototype.id,
  StepRelations
> {

  public readonly operatorSteps: HasManyRepositoryFactory<OperatorStep, typeof Step.prototype.id>;

  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource, @repository.getter('OperatorStepRepository') protected operatorStepRepositoryGetter: Getter<OperatorStepRepository>,
  ) {
    super(Step, dataSource);
    this.operatorSteps = this.createHasManyRepositoryFactoryFor('operatorSteps', operatorStepRepositoryGetter,);
    this.registerInclusionResolver('operatorSteps', this.operatorSteps.inclusionResolver);
  }
}
