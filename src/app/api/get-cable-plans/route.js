import axios from "axios";

export async function POST(req, res) {
  const { providerCode } = await req.json();
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/APICableTVPackagesV2.asp`,
      {
        params: {
          UserID: process.env.NEXT_USER_ID,
        },
      }
    );
    const allData = response.data.TV_ID;

    if (!allData || !allData[providerCode]) {
      return new Response(
        JSON.stringify({ status: false, msg: "Provider not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const providerPlans = allData[providerCode]?.[0]?.PRODUCT || [];

    return new Response(JSON.stringify({ status: true, data: providerPlans }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: false,
        message: error.message || "Error fetching TV plans",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
