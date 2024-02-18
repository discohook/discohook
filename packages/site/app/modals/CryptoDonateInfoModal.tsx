import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { InfoBox } from "~/components/InfoBox";
import { copyText } from "~/util/text";
import { Modal, ModalProps } from "./Modal";

export const CryptoDonateInfoModal = (
  props: ModalProps & {
    wallets: Record<string, string | undefined>;
    type?: string;
    donationKey?: string;
  },
) => {
  const { wallets, type, donationKey: key } = props;
  const address = type ? wallets[type] : undefined;

  return (
    <Modal title="Donate with Crypto" {...props}>
      {address && (
        <div>
          <p className="text-sm select-none">Address ({type?.toUpperCase()})</p>
          <div className="w-full flex">
            <Button
              onClick={() => copyText(address)}
              emoji={{
                name: "📋",
              }}
            />
            <a
              href={`bitcoin:${address}?message=${key}`}
              className="block my-auto ml-2 text-blurple-400 hover:underline truncate"
            >
              {address}
            </a>
          </div>
          <p className="text-sm select-none mt-2">Donation Key</p>
          <div className="w-full flex">
            <Button
              onClick={() => copyText(key ?? "")}
              emoji={{
                name: "📋",
              }}
            />
            <p className="my-auto ml-2 truncate">{key}</p>
          </div>
          <div className="mt-2" />
          <InfoBox>
            <CoolIcon icon="Info" /> Include the donation key in your message so
            Boogiehook can verify who the donation came from.
          </InfoBox>
          <div className="-mb-4" />
        </div>
      )}
    </Modal>
  );
};
