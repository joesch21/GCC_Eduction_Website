import { Claimed as ClaimedEvent } from "../generated/LearnToEarnRewarder/LearnToEarnRewarder";
import { Claimed } from "../generated/schema";

export function handleClaimed(event: ClaimedEvent): void {
  let entity = new Claimed(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.to = event.params.to;
  entity.amount = event.params.amount;
  entity.save();
}