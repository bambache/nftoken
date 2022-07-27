import { useGlowContext } from "@glow-xyz/glow-react";
import { constructMintNftTx } from "@glow-xyz/nftoken-js";
import React from "react";
import { useBoolean } from "../../hooks/useBoolean";
import { LAMPORTS_PER_SOL } from "../../utils/constants";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { LuxButton } from "../atoms/LuxButton";
import { LuxSubmitButton } from "../atoms/LuxButton";
import { LuxInputField} from "../atoms/LuxInput.tsx"
import { Form, Formik, useFormikContext } from "formik";
import { useNetworkContext } from "../atoms/NetworkContext";

type FormData = {
  totalMintNumber: number;
};

export const MintlistForSale = ({
  mintlist,
}: {
  mintlist: NftokenTypes.Mintlist;
}) => {
  const { network } = useNetworkContext();
  const { glowDetected } = useGlowContext();
  const minting = useBoolean();
  const feeString =
    parseInt(mintlist.price.lamports) / LAMPORTS_PER_SOL + " SOL";
  const maxMint: number = 8;

  const initialValues: FormData = {
    totalMintNumber: 1,
  };

  return (
    <div className="mt-5">
      <div className="text-xl flex-column flex-center-center gap-3 mb-3 font-weight-medium">
        <div>This Mintlist is now For Sale.</div>

        <div>You can mint an NFT for {feeString}</div>
      </div>

      <div className="flex-center-center">
        {glowDetected ? (
          <div>
          <Formik
            initialValues={initialValues}
            onSubmit={async ({
              totalMintNumber,
            }) => {
              minting.setTrue();

              console.log(totalMintNumber);

              while(totalMintNumber > 0) {
                var mintNumber:number = 0;
                if (totalMintNumber >= maxMint)
                  mintNumber = maxMint;
                else
                  mintNumber = totalMintNumber%maxMint;

                console.log(mintNumber);
                if (mintNumber > 0) {
                  totalMintNumber -= mintNumber;

                  const { address: wallet } = await window.glow!.connect();
                  const { transactionBase64 } = await constructMintNftTx({
                      wallet,
                      network,
                      mintlist,
                      mintNumber,
                      });

                  try {
                    await window.glow!.signAndSendTransaction({
                        transactionBase64,
                        network,
                        });
                  } catch (err) {
                    console.error(err);
                  }
                }
              }

              minting.setFalse();
            }}
          >
            <Form>
            <LuxInputField
              label="Number of NFTs to mint at once"
              name="totalMintNumber"
              type="number"
              required
            />
            <LuxSubmitButton
              label="Mint NFT(s)"
              disabled={minting.value}
            />
            </Form>
            </Formik>
          </div>
        ) : (
          <LuxButton
            label={"Download Glow"}
            color={"brand"}
            href={"https://glow.app/download"}
          />
        )}
      </div>
    </div>
  );
};
