export type ItemResponse = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "unclaimed" | "found" | "claimed";
  created_at: string;
  last_location: string;
  date_lost: string | null;
  date_found: string | null;
  image_urls: string[];
  num_images: number;
  posted_by: {
    id: string;
    name: string;
  };
  claimed_by: {
    id: string;
    name: string;
  } | null;
  date_returned: string | null;
};

export type ClaimResponse = {
  id: string;
  claimant: string;
  claimed_item: ItemResponse;
  extra_descriptions: string;
  proof_of_ownerships: string[];
  created_at: string;
};
