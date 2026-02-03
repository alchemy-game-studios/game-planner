import { useParams } from "react-router-dom"
import { EditEntityComponent} from "@/client-graphql/edit-entity/edit-entity-component"

export default function EditEntityPage() {
  const { id, type } = useParams()

  return (
    <div className="p-4">
      <EditEntityComponent id={id!} type={type!} isEdit={true} />
    </div>
  )
}
