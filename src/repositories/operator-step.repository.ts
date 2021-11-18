import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Operator, OperatorStep, OperatorStepRelations, Step} from '../models';
import {OperatorRepository} from './operator.repository';
import {StepRepository} from './step.repository';

export class OperatorStepRepository extends DefaultCrudRepository<
  OperatorStep,
  typeof OperatorStep.prototype.id,
  OperatorStepRelations
  > {

  public readonly operator: BelongsToAccessor<Operator, typeof OperatorStep.prototype.id>;

  public readonly step: BelongsToAccessor<Step, typeof OperatorStep.prototype.id>;

  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource, @repository.getter('OperatorRepository') protected operatorRepositoryGetter: Getter<OperatorRepository>, @repository.getter('StepRepository') protected stepRepositoryGetter: Getter<StepRepository>,
  ) {
    super(OperatorStep, dataSource);
    this.step = this.createBelongsToAccessorFor('step', stepRepositoryGetter,);
    this.registerInclusionResolver('step', this.step.inclusionResolver);
    this.operator = this.createBelongsToAccessorFor('operator', operatorRepositoryGetter,);
    this.registerInclusionResolver('operator', this.operator.inclusionResolver);
  }
}
