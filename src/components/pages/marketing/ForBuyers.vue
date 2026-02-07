<template>
    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">For cities / HOAs / buyers</h2>
            <router-link to="/" class="btn btn-outline-secondary">Home</router-link>
        </div>

        <div class="row g-4 mb-4">
            <div class="col-lg-7">
                <p class="lead text-muted">
                    Post landscaping contracts with structured requirements and review contractor submissions with clear compliance summaries.
                </p>
                <ul class="text-muted">
                    <li>Define required coverage types and minimum limits</li>
                    <li>See pass/fail + reasons for each application</li>
                    <li>Reduce risk by making compliance explicit and auditable</li>
                </ul>

                <div class="d-flex gap-2 flex-wrap">
                    <router-link to="/signup?role=bid_poster" class="btn btn-primary">Create buyer account</router-link>
                    <router-link to="/login" class="btn btn-outline-primary">Log in</router-link>
                </div>
            </div>
            <div class="col-lg-5">
                <div class="card p-4">
                    <h5 class="mb-2">Best for</h5>
                    <ul class="text-muted mb-0">
                        <li>Maintenance contracts</li>
                        <li>Install projects</li>
                        <li>Seasonal work</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Compliance visibility</h5>
                <p class="text-muted mb-0">
                    Every application includes a deterministic compliance result with explicit reasons (missing, expired, expiring, insufficient limits).
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ForBuyers'
}
</script>

<style scoped>
.card {
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>

