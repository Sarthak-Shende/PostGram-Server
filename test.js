import {
	S3Client,
	ListBucketsCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();


// Profile in the AWS config and credentials files


// When using a non-default profile with the AWS SDK for
// JavaScript v3, we have to explicitly load the profile's
// configuration and credentials from the AWS config files.
// If you are using the default profile, you do not need the
// following three lines of code.


// Initialize the B2 Client from the profile.
// If you are using the default profile,
// you can create the client with no arguments, i.e.
//
// const b2 = new S3Client();
//
const b2 = new S3Client({
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
	region: process.env.B2_REGION,
	endpoint: process.env.B2_ENDPOINT,
});

// Function to list all buckets
const listBuckets = async () => {
	try {
		const response = await b2.send(new ListBucketsCommand({}));
		console.log("Buckets in account:");
		response.Buckets.forEach((bucket) => {
			console.log(bucket.Name);
		});
	} catch (err) {
		console.error("Error listing buckets:", err);
		throw err;
	}
};

await listBuckets();
