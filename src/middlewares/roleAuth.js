/**
 * Middleware for Role-based and Premium Feature Access Control
 */

const checkPremiumUser = (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.isPremium) {
      return res.status(403).json({
        success: false,
        message: "Access denied: This feature is only available for Premium members",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Authorization check failed: " + err.message,
    });
  }
};

const requireMembershipTier = (tier) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user || !user.isPremium) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Premium membership required",
        });
      }

      if (tier && user.membershipType !== tier) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Requires ${tier} membership tier`,
        });
      }
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Authorization check failed: " + err.message,
      });
    }
  };
};

module.exports = {
  checkPremiumUser,
  requireMembershipTier,
};
