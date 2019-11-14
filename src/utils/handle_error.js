
const errorHandler = () => {
  this.handleError = async (err) => {
    await logger.logError(err);
    await sendMailToAdminIfCritical;
    await saveInOpsQueueIfCritical;
    await determineIfOperationalError;
  };
}

module.exports = errorHandler;