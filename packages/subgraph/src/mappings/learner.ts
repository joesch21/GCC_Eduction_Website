import {
  Enrolled as EnrolledEvent,
  Committed as CommittedEvent,
  Revealed as RevealedEvent,
  ProgressAttested as ProgressEvent
} from "../generated/LearnerRegistry/LearnerRegistry";
import { Enrolled, Committed, Revealed, ProgressAttested } from "../generated/schema";

export function handleEnrolled(event: EnrolledEvent): void {
  let entity = new Enrolled(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.learner = event.params.learner;
  entity.cohortId = event.params.cohortId;
  entity.save();
}

export function handleCommitted(event: CommittedEvent): void {
  let entity = new Committed(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.learner = event.params.learner;
  entity.answerHash = event.params.answerHash;
  entity.deptId = event.params.deptId;
  entity.save();
}

export function handleRevealed(event: RevealedEvent): void {
  let entity = new Revealed(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.learner = event.params.learner;
  entity.deptId = event.params.deptId;
  entity.save();
}

export function handleProgressAttested(event: ProgressEvent): void {
  let entity = new ProgressAttested(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.learner = event.params.learner;
  entity.stateRoot = event.params.stateRoot;
  entity.save();
}