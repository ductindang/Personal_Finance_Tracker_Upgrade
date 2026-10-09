using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceTracker.Data;
using PersonalFinanceTracker.Hubs;
using PersonalFinanceTracker.Models;
using PersonalFinanceTracker.Repositories;
using PersonalFinanceTracker.Repositories.Interfaces;
using PersonalFinanceTracker.Services;
using PersonalFinanceTracker.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSignalR();

// Add CORS Policy for React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // React development URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for cross-origin cookie authentication
    });
});

// Application Insight config for azure
var aiConfig = builder.Configuration.GetSection("ApplicationInsights").Get<ApplicationInsightSettings>();

// Register IOption to inject into Services
builder.Services.Configure<ApplicationInsightSettings>(builder.Configuration.GetSection("ApplicationInsights"));
if(aiConfig != null && aiConfig.IsUseApplicationInsights && !string.IsNullOrEmpty(aiConfig.ConnectionString)){
    builder.Services.AddApplicationInsightsTelemetry(options =>
    {
        options.ConnectionString = aiConfig.ConnectionString;
        options.EnableDependencyTrackingTelemetryModule = aiConfig.EnableDependencyTracking;
    });
}

builder.Services.AddDbContext<FinanceDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Register Authentication Services
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    // Return 401 Unauthorized instead of redirecting to login page for API requests
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
    // SameSite=Lax là cài đặt an toàn quan trọng để trình duyệt chấp nhận Cookie trên môi trường http://localhost
    options.Cookie.SameSite = SameSiteMode.Lax;
    // SameSite=Lax chỉ hoạt động với HTTPS, vì vậy cần set SecurePolicy = SameAsRequest để cho phép http
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.Cookie.HttpOnly = true;
})
.AddCookie("ExternalCookie", options =>
{
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
})
.AddGoogle(options =>
{
    options.SignInScheme = "ExternalCookie";
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    options.ClaimActions.MapJsonKey("picture", "picture");

    // BẮT BUỘC: Để Chrome chấp nhận cookie khi Google redirect về IIS
    options.CorrelationCookie.SameSite = SameSiteMode.None;
    options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;
    options.CorrelationCookie.HttpOnly = true;
    options.CorrelationCookie.IsEssential = true;
});

// Register Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ISavingsGoalRepository, SavingsGoalRepository>();
builder.Services.AddScoped<IBudgetRepository, BudgetRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IRecurringTransactionRepository, RecurringTransactionRepository>();
builder.Services.AddScoped<IUserSecurityCodeRepository, UserSecurityCodeRepository>();
builder.Services.AddScoped<IChatMessageRepository, ChatMessageRepository>();

// Register Services
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Smtp"));
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ISavingsService, SavingsService>();
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<IRecurringTransactionService, RecurringTransactionService>();
builder.Services.AddScoped<IChatMessageService, ChatMessageService>();

// Enable Swagger API Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.Use((context, next) =>
{
    context.Request.Scheme = "https";
    return next();
});
app.UseForwardedHeaders();

app.Use((context, next) =>
{
    // Nếu request đến qua https hoặc qua IIS HTTPS header
    if (context.Request.Headers["X-Forwarded-Proto"] == "https" || context.Request.IsHttps)
    {
        context.Request.Scheme = "https";
    }
    return next();
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Personal Finance Tracker API v1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at the application root URL (http://localhost:5051/)
    });
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

//app.UseHttpsRedirection();
app.UseRouting();

// Enable CORS
app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");

app.Run();
