/**
 * Metadata Service
 *
 * Handles the creation and uploading of NFT metadata to Arweave
 */

import { config } from "../config/config.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { createGenericFile } from "@metaplex-foundation/umi";

class MetadataService {
  /**
   * Create NFT metadata
   * @param {Object} params - Metadata parameters
   * @returns {Object} NFT metadata
   */
  createMetadata(params) {
    const { imageUrl, prompt } = params;
    const metadataTimestamp = Math.floor(Date.now() / 1000);

    return {
      name: `StalkGen Meme #${metadataTimestamp}`,
      description: `A meme generated from prompt: ${prompt}`,
      image: imageUrl,
      attributes: [
        {
          trait_type: "Meme Type",
          value: "Generated",
        },
        {
          trait_type: "Timestamp",
          value: metadataTimestamp.toString(),
        },
        {
          trait_type: "Prompt",
          value: prompt,
        },
      ],
      external_url: config.nftMetadata.externalUrl,
      seller_fee_basis_points: config.nftMetadata.sellerFeeBasisPoints,
      creators: config.nftMetadata.creators,
    };
  }

  /**
   * Create Umi instance with Irys uploader
   * @returns {Object} Umi instance
   */
  createUmiInstance() {
    const rpcUrl =
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
    const irysUrl =
      process.env.NEXT_PUBLIC_IRYS_URL || "https://devnet.irys.xyz";

    return createUmi(rpcUrl).use(
      irysUploader({
        address: irysUrl,
        // Use free devnet
        network: "devnet",
      }),
    );
  }

  /**
   * Upload image to Arweave using Umi + Irys
   * @param {Buffer} imageBuffer - Image buffer
   * @param {string} filename - Image filename
   * @param {string} contentType - Image content type
   * @returns {Promise<string>} Image URI
   */
  async uploadImage(imageBuffer, filename, contentType) {
    console.log("Uploading image to Arweave using Umi + Irys...");

    try {
      const umi = this.createUmiInstance();

      // Create GenericFile from buffer
      const genericFile = createGenericFile(imageBuffer, filename, {
        contentType,
        tags: [{ name: "Content-Type", value: contentType }],
      });

      // Upload image
      const [imageUri] = await umi.uploader.upload([genericFile]);

      console.log("Image uploaded successfully:", imageUri);
      return imageUri;
    } catch (error) {
      console.error("Error in uploadImage:", error);
      throw error;
    }
  }

  /**
   * Upload metadata to Arweave using Umi + Irys
   * @param {Object} metadata - NFT metadata
   * @returns {Promise<string>} Metadata URI
   */
  async uploadMetadata(metadata) {
    console.log("Uploading metadata to Arweave using Umi + Irys...");

    try {
      const umi = this.createUmiInstance();

      // Upload metadata as JSON
      const metadataUri = await umi.uploader.uploadJson(metadata);

      console.log("Metadata uploaded successfully:", metadataUri);
      return metadataUri;
    } catch (error) {
      console.error("Error in uploadMetadata:", error);
      throw error;
    }
  }

  /**
   * Create and upload metadata to Arweave
   * @param {Object} params - Metadata parameters
   * @returns {Promise<Object>} Metadata and URI
   */
  async createAndUploadMetadata(params) {
    const metadata = this.createMetadata(params);
    const metadataUri = await this.uploadMetadata(metadata);

    return {
      metadata,
      metadataUri,
    };
  }
}

export const metadataService = new MetadataService();
