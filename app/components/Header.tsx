import { ButtonStyle } from "discord-api-types/v10"
import { Button } from "./Button"

export const Header: React.FC<{}> = ({}) => {
  return (
    <div className="sticky top-0 left-0 z-10 bg-slate-50 shadow-md w-full px-4 h-12 flex">
      <Button className="my-auto ml-auto" discordstyle={ButtonStyle.Link}>
        Help
      </Button>
    </div>
  )
}
