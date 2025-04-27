const calculateTotalRewardByProduct = async (order) => {
  let rewardCount = 0;

  order?.products?.map((item) => {
    const subProductRward = item?.product?.rewardPoints * item?.quantity;

    rewardCount = rewardCount + subProductRward;
  });

  return rewardCount;
};

module.exports = {
  calculateTotalRewardByProduct,
};
