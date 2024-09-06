import ReactSelect from "react-select";
import { ResolvableAPIRole } from "~/util/cache/CacheManager";
import { selectClassNames } from "./StringSelect";
import { RoleShield } from "./icons/role";

const getOption = (role: ResolvableAPIRole, assignable?: boolean) => ({
  label: (
    <div className="flex">
      <RoleShield style={{ color: `#${role.color.toString(16)}` }} />
      <span className="my-auto ltr:ml-1 rtl:mr-1">{role.name}</span>
    </div>
  ),
  value: role.id,
  role,
  isDisabled: assignable === false,
});

export const RoleSelect = (props: {
  roles: ResolvableAPIRole[];
  name?: string;
  value?: ResolvableAPIRole | null;
  isClearable?: boolean;
  isDisabled?: boolean;
  isMulti?: boolean;
  onChange?: (channel: ResolvableAPIRole | null) => void;
  unassignable?: "disable" | "omit";
  guildId?: string;
  userHighestPosition?: number;
}) => {
  const getRoleAssignable = (role: ResolvableAPIRole) =>
    props.unassignable
      ? !role.managed &&
        (props.guildId ? role.id !== props.guildId : true) &&
        (props.userHighestPosition !== undefined
          ? role.position < props.userHighestPosition
          : true)
      : true;

  return (
    <ReactSelect
      isClearable={props.isClearable}
      isDisabled={props.isDisabled}
      isMulti={props.isMulti}
      name={props.name}
      value={
        props.value
          ? getOption(props.value, getRoleAssignable(props.value))
          : undefined
      }
      options={props.roles
        .filter(
          (r) => !(props.unassignable === "omit" && !getRoleAssignable(r)),
        )
        .map((r) => getOption(r, getRoleAssignable(r)))}
      classNames={selectClassNames}
      onChange={(raw) => {
        const opt = raw as ReturnType<typeof getOption> | null;
        if (props.onChange) {
          props.onChange(opt?.role ?? null);
        }
      }}
    />
  );
};
