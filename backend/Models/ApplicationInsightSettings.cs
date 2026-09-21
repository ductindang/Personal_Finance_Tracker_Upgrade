namespace PersonalFinanceTracker.Models
{
    public class ApplicationInsightSettings
    {
        public bool IsUseApplicationInsights { get; set; } = false;
        public string ConnectionString { get; set; } = string.Empty;
        public bool EnableDependencyTracking { get; set; } = false;
    }
}
