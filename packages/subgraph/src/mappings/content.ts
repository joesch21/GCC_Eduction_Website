import { ContentRootUpdated as Event } from "../generated/ContentRegistry/ContentRegistry";
import { ContentRootUpdated } from "../generated/schema";

export function handleContentRootUpdated(event: Event): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32());
  let entity = new ContentRootUpdated(id);
  entity.root = event.params.root;
  entity.uri = event.params.uri;
  entity.save();
}