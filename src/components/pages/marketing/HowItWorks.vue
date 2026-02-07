<template>
    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">How it works</h2>
            <router-link to="/" class="btn btn-outline-secondary">Home</router-link>
        </div>

        <div class="row g-4">
            <div class="col-md-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">1) Build a role-based profile</h5>
                        <p class="text-muted mb-0">
                            Contractors, buyers, and brokerages each get a clean experience tailored to what they need.
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">2) Attach structured requirements</h5>
                        <p class="text-muted mb-0">
                            Buyers post contracts with explicit document + coverage requirements (limits, expirations, etc.).
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">3) Deterministic compliance checks</h5>
                        <p class="text-muted mb-0">
                            Every application produces a clear compliance result: compliant, action needed, or non-compliant.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <hr class="my-5" />

        <div class="row g-4">
            <div class="col-lg-6">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">For contractors</h5>
                        <ul class="text-muted mb-3">
                            <li>Upload certificates/bonds/licenses with expiration metadata</li>
                            <li>Apply with one click (auto-attached docs)</li>
                            <li>See exactly what’s missing and why</li>
                        </ul>
                        <router-link to="/for-contractors" class="btn btn-sm btn-outline-primary">Contractor flow</router-link>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">For buyers + brokerages</h5>
                        <ul class="text-muted mb-3">
                            <li>Buyers review submissions with compliance summaries</li>
                            <li>Brokerages match to real coverage gaps (qualified inbound)</li>
                            <li>Everything is auditable and deterministic</li>
                        </ul>
                        <div class="d-flex gap-2 flex-wrap">
                            <router-link to="/for-buyers" class="btn btn-sm btn-outline-primary">Buyer flow</router-link>
                            <router-link to="/for-brokerages" class="btn btn-sm btn-outline-dark">Brokerage flow</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HowItWorks'
}
</script>

<style scoped>
.card {
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>

