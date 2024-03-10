import { CollectionItem } from "~/helpers/api";

type Props = {
  collection: CollectionItem | null;
};

export default function Sidebar({ collection }: Props) {
  return (
    <div className="p-2 flex-col">
      <div className="list-group">
        <div className="list-entry flex justify-space-between align-center">
          {collection?.name}

          <button>
            <i className="bi bi-list" />
          </button>
        </div>
      </div>

      <div className="list-group">
        <div className="list-entry flex justify-space-between align-center">abc</div>
      </div>
    </div>
  );
}
