export default (error: Error): Response => {
  console.error({ message: error.message });
  return Response.json({ message: error.message }, { status: 500 });
};
