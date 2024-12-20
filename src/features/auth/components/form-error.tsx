import { BsExclamationTriangle } from "react-icons/bs"

type Props = {message?: string}

const FormError = ({message}: Props) => {
    if(!message) return null
  return (
    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
        <BsExclamationTriangle className="size-4"/>
    <p className="">{message}</p>
    </div>
  )
}

export default FormError
