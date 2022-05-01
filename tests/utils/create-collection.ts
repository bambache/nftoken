import { Key } from "readline";
import { Nftoken as NftokenTypes } from "../../target/types/nftoken";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  Base58,
  generateAlphaNumericString,
  logCollection,
  logNft,
  strToArr,
} from "./test-utils";

export const createCollection = async ({
  name: _name,
  image_url: _image_url,
  metadata_url: _metadata_url,
  program,
}: {
  name?: string;
  image_url?: string;
  metadata_url?: string;
  program: Program<NftokenTypes>;
}): Promise<{
  signature: Base58;
  creator: PublicKey;
  collection_keypair: Keypair;
}> => {
  const name = strToArr(_name || generateAlphaNumericString(16), 32);
  const image_url = strToArr(_image_url || generateAlphaNumericString(16), 128);
  const metadata_url = strToArr(
    _metadata_url || generateAlphaNumericString(16),
    128
  );

  const collection_keypair = Keypair.generate();

  const creator = anchor.AnchorProvider.local().wallet.publicKey;

  const signature = await program.methods
    .createCollection(name, image_url, metadata_url)
    .accounts({
      collectionAccount: collection_keypair.publicKey,
      creator,
      systemProgram: SystemProgram.programId,
    })
    .signers([collection_keypair])
    .rpc();

  console.log("Created Collection, signature:", signature);
  console.log("Collection Address:", collection_keypair.publicKey.toBase58());

  const fetched_collection = await program.account.collectionAccount.fetch(
    collection_keypair.publicKey
  );
  logCollection(fetched_collection);

  return { signature, collection_keypair, creator };
};
