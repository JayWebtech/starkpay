import axios from "axios";

export async function POST(req, res) {
  const { network } = await req.json();
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/APIDatabundlePlansV2.asp`,
      {
        params: {
          UserID: process.env.NEXT_USER_ID,
        },
      }
    );
    const data = response.data.MOBILE_NETWORK;

    if (!data[network]) {
      return new Response(
        JSON.stringify({ status: false, msg: "Data network not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ status: true, data: data[network] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: false,
        message: error.message || "Error sending request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
